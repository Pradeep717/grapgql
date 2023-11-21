const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./db/connectDB");
const Event = require("./models/event");
const User = require("./models/user");
const bcrpyt = require("bcryptjs");
const user = require("./models/user");

const app = express();
connectDB();

app.use(bodyParser.json());

//initialize graphql schema
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!] 
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
            users: [User!]!

        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find().populate("creator")
          .then((events) => {
            return events.map((event) => {
              return { 
                ...event._doc, 
                _id: event.id, 
                creator: {
                  ...event._doc.creator._doc,
                  _id: event._doc.creator.id
                }
              };

            });
          })
          .catch((err) => {
            throw err;
          });
      },

      users:() =>{
        return User.find()
        .then(users => {
          return users.map(user => {
            return {...user._doc}
          })
        })
        .catch(err => {
          throw err;
        })

      },

      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price, // + converts string to number
          date: new Date(args.eventInput.date), //convert string to date
          creator: "655b17859df85f04e986f177",
        });
        let createdEvent;
        
          return event.save()
          .then((result) => {
            console.log(result);
            createdEvent= { ...result._doc, _id: result.id };
            return User.findById("655b17859df85f04e986f177")
          })
          .then(user=>{
            if(!user){
              throw new Error("User not found.")
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },

      createUser: (args) => {

        return User.findOne({email: args.userInput.email})
        .then(user => {
          if(user){
            throw new Error('User exists already.')
          }
          return bcrpyt.hash(args.userInput.password, 12)
        })
        .then(hashedPassword => {
          console.log("hashedPassword", hashedPassword)
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            return user.save();
        }) 
          .then((result) => {
            console.log(result);
            return { ...result._doc,password: null, _id: result.id};
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
    },
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
