### GraphQL Terminology

- **`query`:** Used to fetch data from the server.
- **`mutation`:** Used to change data on the server.
- **`subscription`:** Used to subscribe to changes in data on the server.
- **`schema`:** Used to define the structure of the data on the server.
- **`type`:** Used to define a type of data.
- **`field`:** Used to define a field on a type.
- **`argument`:** Used to define an argument that can be passed to a field.
- **`input`:** Used to define a type of input data for a mutation.


### Examples of Using GraphQL

#### Fetch a list of create event :
```graphql
mutation{
  createEvent(eventInput:{title:"New Event", description:"example description", price:90.12,date:"2023-11-21T03:35:35.750Z"}){
		title
    price
    creator {
      password
    }
    
  }
}
```

#### Fetch a list of create user :
```graphql
mutation {
  createUser(userInput:{email:"kkw", password:"knjkj"}){
    email
  }
}

```



#### Fetch a list of events:
```graphql
query{
  events{
    _id
    title
    description
    price
    creator {
      email
      _id
      password
    }
  }
}
```

#### Fetch a list of users:
```graphql
query{
  users {
    email
  }
}
```


## Note

```
// Create GraphQL server
app.use(
  '/graphql',
    graphqlHTTP({
    schema: schema, // create schema in graphql
    rootValue: resolvers, // create all query mutations 
    graphiql: true, // Enable GraphiQL interface
  })
);

app.listen(3000, () => {
  console.log('GraphQL server running on port 3000');
});


```

```
// created events and users => query 
 type RootQuery {
            events: [Event!]!
            users: [User!]!

        }


// create createEvent and createUsedr => mutations
type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

//schema 
 schema {
            query: RootQuery
            mutation: RootMutation
        }

```

```
//tpyes and its input 

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

```

```
// events
// users
// createEvent
// createUser

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


```
## Photos

![](https://res.cloudinary.com/dj76d2css/image/upload/v1700546871/69809f49-3a37-4933-b14c-cd2ef3b13b1d_zekmyf.jpg)

![](https://res.cloudinary.com/dj76d2css/image/upload/v1700547154/Code_bmHCfm7S0j_fleegr.png)
