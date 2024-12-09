const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/userjournal', {
   useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Schema

const jorunalSchema = new mongoose.Schema({
color:{   type: String, default: ""},
description:{   type: String, default: ""},
category:{  type:mongoose.Schema.ObjectId, ref:"Category"},
date:{  type: String, default: ""}
});

const categorySchema = new mongoose.Schema({
    name:{   type: String, default: ""},
    date:{  type: String, default: ""}
    });
    
    const Category = mongoose.model('Category', categorySchema);
    const Journal = mongoose.model('Journal', jorunalSchema);
  
// Routes
app.post('/user/profile/create-journal' , async (req, res) => {
    const { color, description, category } = req.body;
    try {
    if (color !== 'pink' && color !== 'orange' && color !== 'yellow' && color !== 'blue'&& color !== 'green' && color !== 'white' && color !== 'black' ) {
        return res.status(400).json({
            success: false,
            data: null,
            message: 'Invalid color',
            token: null,
            error: {
                details: {
                    MESSAGE: 'Invalid color'
                }
            }
        });
    }
        if (typeof description !== 'string') {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid request',
                token: null,
                error: {
                    details: {
                        MESSAGE: 'Invalid description'
                    }
                }
            });
        }
        if (typeof category !== 'string') {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid request',
                token: null,
                error: {
                    details: {
                        MESSAGE: 'Invalid category'
                    }
                }
            });
        }
        const newJournal = new Journal({ color, description, category, date:new Date()});

        await newJournal.save()
        .then(result => {
            return res.status(200).json({
                success: true,
                data: {
                    journalId: result._id,
                    color: result.color,
                    description: result.description,
                    category: result.category,
                    date: result.date
                },
                message: 'journal created successfully',
            });
        })
    } catch (error) {
        res.status(500).json({ success: false, 
          message: 'Invalid request', error });
    }
});

app.put('/user/profile/update-journal', async (req, res) => {
    const { journalId, color, description, category } = req.body;
    const updateData = req.body;
    try {
        if ((color || '').trim() === '' &&  (description || '').trim() === '' &&  (category || '').trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Nothing to Updated. Nothing is Updated',
                error: {
                        CODE: 'INVALID_REQUEST',
                        MESSAGE: 'Nothing to Updated. Nothing is Updated'
                }
            });
        }

        const updatedUser = await Journal.findOneAndUpdate({ _id:journalId }, updateData, { new: true }).populate('category');

        if (!updatedUser) {
          return res.status(404).json({
              success: false,
              message: "Invalid request",
              error: {
                CODE: "NO_USER_FOUND",
                MESSAGE: "No user found"
            
              }
          });
      }
      res.status(200).json({
            success: true,
            data: {
                updatedUser
            },
            message: "User journal Updated Successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "SERVER_ERROR",
                MESSAGE: "Server error",
                }
            }
        );
    }
  });

  app.delete('/user/profile/delete-journal', async (req, res) => {
    const { journalId } = req.body;
    try{
        const journal = await Journal.findOne({ _id : journalId });

        if (!journal) {
            return res.status(404).json({
                success: false,
                message: "Invalid request",
                error: `journal with id: ${journalId} not found. No journal is deleted.`} );
            }
        await Journal.deleteOne({ _id: journalId });
        res.json({
          success: true,
          message: "User journal deleted Successfully",
        });
    }  catch (err) {
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.MESSAGE
            }
        });
    }
  });

  app.get('/user/profile/journal-list', async (req, res) => {
    try{
        const journalList= await Journal.find().populate('category').sort({date:1});

        res.status(200).json({
            success: true,
            data:{
                journalList
            } 
        });

    }  catch (err) {
        console.log("err", err)
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.MESSAGE
            }
        });
    }
  });
 
  app.get('/user/profile/search-by-id/:journalid', async (req, res) => {
           // id is in path parameter
    const {journalid} = req.params;
    try{
        const searchedJournal = await Journal.findOne({ _id:journalid });

        res.status(200).json({
            success: true,
            data:{
                searchedJournal
            } 
        });
    }  catch (err) {
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.MESSAGE
            }
        });
    }
  });

  app.get('/user/profile/search-journal/:description', async (req, res) => {
    const {description }= req.params;
    try{
        const searchedJournal = await Journal.findOne({ description:new RegExp(description, 'i') });

        res.status(200).json({
            success: true,
            data:{
                searchedJournal
            } 
        });
    }  catch (err) {
    res.status(500).json({
        success: false,
        message: "Invalid request",
        error: {
            CODE: "INTERNAL_SERVER_ERROR",
            MESSAGE: err.MESSAGE
        }
        });
    }
});

app.post('/users/create-category' , async (req, res) => {
const { name } = req.body;
try {
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            success: false,
            data: null,
            message: 'Invalid name',
            token: null,
            error: {
                details: {
                    MESSAGE: 'Invalid name'
                }
            }
        });
    }
 
    const newCategory = new Category({ name, date:new Date()});

        await newCategory.save()
        .then(result => {
            return res.status(200).json({
                success: true,
                data: {
                    categoryId: result._id,
                    name: result.name,
                    date: result.date
                },
                message: 'journal created successfully',
            });
        })
    } catch (error) {
        res.status(500).json({ success: false, 
          message: 'Invalid request', error });
    }
});

app.get('/user/profile/get-categories', async (req, res) => {
    try{
        const categoriesList= await Category.find();

        res.status(200).json({
            success: true,
            data:{
                categoriesList
            } 
        });

    }  catch (err) {
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.MESSAGE
            }
        });
    }
});

app.get('/user/profile/filter', async (req, res) => {
    // filter is in query parameter
const {filtertype} = req.query;
try{
    if( filtertype !== 'color' && filtertype !== 'description' && filtertype !== 'date' ){
            return res.status(400).json({
                success: false,
                message: 'Invalid filter type',
                error: {
                    details: {
                        MESSAGE: 'Invalid filter type'
                    }
                }
            });
        }
        if( filtertype === 'date' ){
            const journalList= await Journal.find().populate('category').sort({date:1});
    
            res.status(200).json({
                success: true,
                data:{
                    journalList
                } 
            });
        } else if( filtertype === 'description' ){
        const journalList= await Journal.find().populate('category');        
        journalList.sort((a, b) => b.description.length - a.description.length);

        res.status(200).json({
                success: true,
                data:{
                    journalList
                }
            })
    } else if( filtertype === 'color' ){     // colors: 1-pink, 2-orange, 3-yellow, 4-blue, 5-green, 6-white, 7-black
        const journalList= await Journal.find().populate('category');
        
        const colorpriority = { pink: 1, orange: 2, yellow: 3, blue: 4, green: 5 , white: 6, black: 7};

        journalList.sort(function (a, b) {
           return colorpriority[a.color] - colorpriority[b.color];
       });
       
        res.status(200).json({
            success: true,
            data:{
                journalList
            }
        })
        
    } 
}  catch (err) {
 res.status(500).json({
     success: false,
     message: "Invalid request",
     error: {
         CODE: "INTERNAL_SERVER_ERROR",
         MESSAGE: err.MESSAGE
     }
 });
}
});

app.listen(port, () => console.log(`Server running on port ${port}`));