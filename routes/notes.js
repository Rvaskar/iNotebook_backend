const express = require('express');
const fetchuser = require('../middleware/fetchUser');
const router = express.Router();
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator'); //importing data validator for validate user input data



//! ROUTE1: CREATING ENDPOINT FOR GETTING  ALL THE NOTES


  //Get all the notes using : GET "/api/notes/getuser". require login

router.get('/fetchallnotes', fetchuser, async(req, res)=>{
    try {
      //fetching or getting all note with corresponding user id
      const notes = await Note.find({user: req.user.id})
      res.json(notes)
      
    }catch (error) {
      //if any error ocurred then it will be display
        console.error(error.message);
        res.status(500).send("Internal Sever Error.")
    }

})

//! ROUTE2: CREATING ENDPOINT FOR ADDING NOTES IN DATABASE


  //add notes using : POST "/api/notes/addnote". require login

router.post('/addnote', fetchuser,[

  //validating all the data before adding
  body('title','Enter valid title').isLength({ min: 3 }),
  body('description','description at least 5 characters').isLength({ min: 5 }),

  ], async(req, res)=>{
      try {

        //adding notes in database
        //here we use destructure method in react 
        const {title, description, tags} = req.body;

        // If there are errors, return Bad request and the errors

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
          title, description, tags, user: req.user.id
        })
        
        //adding note
        const savedNote = await note.save()

        res.json(savedNote)

    } catch (error) {
      //if any error ocurred then it will be display
        console.error(error.message);
        res.status(500).send("Internal Sever Error.")
    }

  })

//! ROUTE3: CREATING ENDPOINT FOR UPDATING EXISTING  NOTES IN DATABASE


  //updating notes using : PUT "/api/notes/updatenote/:id". require login

  router.put('/updatenote/:id', fetchuser, async(req, res)=>{

    try {

         //here we use destructure method in react 
        const {title, description, tags} = req.body;

         //create a new note object
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tags){newNote.tag = tags};

        //Find the note to be update and update it
        //req.param ::: param use to get information from URL in this we use id
        let note = await Note.findById(req.params.id)

        //checking note are available or not
        if(!note){
          return res.status(401).send("Not found")
        }

        //Verifying the user is same of different (valid or not)
        if(note.user.toString() !== req.user.id){
          return res.status(401).send("Not Allowed")
        }

        // new: true  ::: means if new note is available then update

        note = await Note.findByIdAndUpdate(req.params.id, {$set : newNote}, {new:true});

        res.json({note});
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error ")
      }

    })


//! ROUTE4: CREATING ENDPOINT FOR DELETING EXISTING  NOTES IN DATABASE


  //deleting notes using : DELETE "/api/notes/updatenote". require login

  router.delete('/deletenote/:id', fetchuser, async(req, res)=>{
    
    try {

        //Find the note to be delete and delete it
        //req.param ::: param use to get information from URL in this we use id
        let note = await Note.findById(req.params.id)

        //checking note are available or not
        if(!note){
          return res.status(401).send("Not found")
        }
        
        //Verifying the user is same of different (valid or not)
        //Allow deletion only if user own this note
        if(note.user.toString() !== req.user.id){
          return res.status(401).send("Not Allowed")
        }

        // new: true  ::: means if new note is available then update

        note = await Note.findByIdAndDelete(req.params.id);

        res.json({"success" : "Note has been deleted", note: note});

      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error ")
      }

    })
  


module.exports = router