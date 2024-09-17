const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://malav:malavpatel@user.gq255.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
var userCollection;
var orderCollection;

client.connect(err => {
   userCollection = client.db("giftdelivery").collection("users");
   orderCollection = client.db("giftdelivery").collection("orders");
   
  // perform actions on the collection object
  console.log ('Database up!\n')
 
});


app.get('/', (req, res) => {
  res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})

app.post('/signup', (req, res) => {
    console.log("POST request received for user signup: " + JSON.stringify(req.body) + "\n");

    const newUser = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        contact: req.body.contact,
        phoneNumber: req.body.phoneNumber,
        state: req.body.state,
        address: req.body.address,
        postcode: req.body.postcode
    };

    userCollection.insertOne(newUser, (err, result) => {
        if (err) {
            console.error("Error inserting user: " + err + "\n");
            res.status(500).send(err);
        } else {
            console.log("User created with ID " + result.insertedId + "\n");
            res.status(201).send({ message: "User created successfully", userId: result.insertedId });
        }
    });
});


app.delete('/deleteOrders', (req, res) => {
    console.log("DELETE request received to delete orders: " + JSON.stringify(req.body) + "\n");

    const orderIds = req.body.orderIds;

    orderCollection.deleteMany({ orderNo: { $in: orderIds } }, (err, result) => {
        if (err) {
            console.error("Error deleting orders: " + err + "\n");
            res.status(500).send(err);
        } else {
            console.log(result.deletedCount + " orders deleted.\n");
            res.status(200).send({ deletedCount: result.deletedCount });
        }
    });
});

 
app.get('/getUserDataTest', (req, res) => {

	console.log("GET request received\n"); 

	userCollection.find({}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
			console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});


app.get('/getOrderDataTest', (req, res) => {

	console.log("GET request received\n"); 

	orderCollection.find({},{projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});


app.post('/verifyUser', (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	loginData = req.body;

	userCollection.find({email:loginData.email, password:loginData.password}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
		    console.log(JSON.stringify(docs) + " have been retrieved.\n");
		   	res.status(200).send(docs);
		}	   
		
	  });

});


app.post('/postOrderData', function (req, res) {
    
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 
    
    orderCollection.insertOne(req.body, function(err, result) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		}else {
			console.log("Order record with ID "+ result.insertedId + " have been inserted\n"); 
			res.status(200).send(result);
		}
		
	});
       
});

app.post('/getOrders', (req, res) => {
    console.log("POST request received to get user orders: " + JSON.stringify(req.body) + "\n");

    const userEmail = req.body.email;

    if (!userEmail) {
        console.error("Email is missing in the request body.");
        res.status(400).send({ error: "Email is required" });
        return;
    }

    // Query for orders with matching customer email
    orderCollection.find({ customerEmail: userEmail }, { projection: { _id: 0 } }).toArray((err, docs) => {
        if (err) {
            console.error("Error retrieving orders: " + err + "\n");
            res.status(500).send(err);
        } else {
            console.log("Orders retrieved:", docs);
            res.status(200).send(docs);
        }
    });
});


  
app.listen(port, () => {
  console.log(`Gift Delivery server app listening at http://localhost:${port}`) 
});
