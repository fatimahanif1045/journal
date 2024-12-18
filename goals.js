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

const remSubSchema = new mongoose.Schema({
    day: { type: [String],},
    time: String
});

const goalSchema = new mongoose.Schema({
    icon:{  type: String, default: ""},
    name:{  type: String, default: ""},
    category:{  type: String, default: ""},
    achieveXDays:{  type: Number, default: ""},
    goalImportance:{  type: Number, default: ""},
    color:{   type: String, default: ""},
    achieveType:{   type: String, default: ""},
    description:{   type: String, default: ""},
    measureType:{   type: String, default: ""},
    measureValue:{   type: String, default: ""},
    reminders:  [remSubSchema]
});

const detSubSchema = new mongoose.Schema({
    type: String,
    value: {type: String, required: true},
    comment: String,
    goal: {type:mongoose.Schema.ObjectId, ref:"Goal", required: true },

});

const reportSchema = new mongoose.Schema({
date: String,
details: [detSubSchema]
});

const Goal = mongoose.model('Goal', goalSchema);
const Report = mongoose.model('Report', reportSchema);

// Routes
app.post('/user/profile/create-goal' , async (req, res) => {
    const { icon, name, category, achieveXDays, goalImportance, color, achieveType, description, measureType, measureValue, reminders } = req.body;
    try {
        if (typeof icon !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
                error: {
                    details: {
                        MESSAGE: 'Invalid icon'
                    }
                }
            });
        }

        if (typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
                error: {
                    details: {
                        MESSAGE: 'Invalid name'
                    }
                }
            });
        }
        if (category !== 'welbeing' && category !== 'vacational' && category !== 'personal development' ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
                error: {
                    details: {
                        MESSAGE: 'Invalid category'
                    }
                }
            });
        }

        if (typeof achieveXDays !== 'number' || achieveXDays < 1 || achieveXDays > 7 ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
                error: {
                    details: {
                        MESSAGE: 'Invalid achieveXDays'
                    }
                }
            });
        }

        if (typeof goalImportance !== 'number' || goalImportance < 0 || goalImportance > 10 ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
                error: {
                    details: {
                        MESSAGE: 'Invalid goalImportance'
                    }
                }
            });
        }

        if (typeof color !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid color',
                error: {
                    details: {
                        MESSAGE: 'Invalid color'
                    }
                }
            });
        }

        if (achieveType !== 'Month' && achieveType !== 'Week') {
            return res.status(400).json({
                success: false,
                message: 'Invalid achieveType',
                error: {
                    details: {
                        MESSAGE: 'Invalid achieveType'
                    }
                }
            });
        }

        if (typeof description !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
                error: {
                    details: {
                        MESSAGE: 'Invalid description'
                    }
                }
            });
        }

        if (typeof measureType !== 'string' && typeof measureType !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
                error: {
                    details: {
                        MESSAGE: 'Invalid measureType'
                    }
                }
            });
        }
        
        if (typeof measureValue !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
                error: {
                    details: {
                        MESSAGE: 'Invalid measureValue'
                    }
                }
            });
        }
        /*if (typeof reminders[time] !== 'string') {
    return res.status(400).json({
        success: false,
        message: 'Invalid request',
        error: {
            details: {
                MESSAGE: 'Invalid reminder'
            }
        }
    });
}*/
    const newGoal = new Goal({icon, name, category, achieveXDays, goalImportance, color, achieveType, description, measureType, measureValue, reminders});

        await newGoal.save()
        .then(result => {
            return res.status(200).json({
                success: true,
                data: {
                    result
                },
                message: 'goal created successfully',
            });
        })
    } catch (error) {
        res.status(500).json({ success: false, 
            message: 'Invalid request', error });
    }
});

app.put('/user/profile/update-goal', async (req, res) => {
    const { goalId, icon, name, category, achieveXDays, goalImportance, color, achieveType, description, measureType, measureValue, reminders  } = req.body;
    const updateData = req.body;
    try {
            const updatedGoal = await Goal.findOneAndUpdate({ _id:goalId }, updateData, { new: true });

        if (!updatedGoal) {
            return res.status(404).json({
                success: false,
                message: "Invalid request",
                error: {
                MESSAGE: "No goal found"
            
                }
            });
        }
        res.status(200).json({
            success: true,
            data: {
                updatedGoal
            },
            message: "User goal Updated Successfully",
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

app.delete('/user/profile/delete-goal', async (req, res) => {
const { goalId } = req.body;
try{
    const goal = await Goal.findOne({ _id : goalId });

    if (!goal) {
        return res.status(404).json({
            success: false,
            message: "Invalid request",
            error: `goal with id: ${goalId} not found. No goal is deleted.`} );
        }
    await goal.deleteOne({ _id: goalId });
    res.json({
        success: true,
        message: "User Goal deleted Successfully",
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

app.get('/user/profile/user-goals', async (req, res) => {
try{
    const userGoal= await Goal.find();

    res.status(200).json({
        success: true,
        data:{
            userGoal
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

app.get('/user/profile/search-by-id/:goalid', async (req, res) => {
        // id is in path parameter
const {goalid} = req.params;
try{
    const goal = await Goal.findOne({ _id:goalid });

    res.status(200).json({
        success: true,
        data:{
            goal
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

app.post('/user/profile/submit-report' , async (req, res) => {
    const { date, details } = req.body;
    try {
        if (typeof date !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid date',
                error: {
                    details: {
                        MESSAGE: 'Invalid date'
                    }
                }
            });
        }
    
        const newReport = new Report({date, details });

        await newReport.save()
        .then(result => {
            return res.status(200).json({
                success: true,
                data: {
                    result
                },
                message: 'report submitted successfully',
            });
        })
    } catch (error) {
        res.status(500).json({ success: false, 
            message: 'Invalid request', error });
    }
});

app.get('/user/profile/search-repoort-by-id/:reportid', async (req, res) => {
    // id is in path parameter
const {reportid} = req.params;
try{
const report = await Report.findOne({ _id:reportid }).populate('details.goal');
console.log(report);
res.status(200).json({
    success: true,
    data:{
        report
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

app.get('/user/profile/search-report-by-date/:date', async (req, res) => {
    // date is in path parameter
const {date} = req.params;
try{ 
        const searchedReport = await Report.findOne({ date:new RegExp(date, 'i') }).populate('details.goal');

        res.status(200).json({
            success: true,
            data:{
                searchedReport
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

app.put('/user/profile/update-report', async (req, res) => {
    const { date, details } = req.body;
    try {
    const updatedReport = await Report.findOneAndUpdate({date:new RegExp(date, 'i') }, { $push: { details: details } }, { new: true }).populate('details.goal');

        if (!updatedReport) {
            return res.status(404).json({
                success: false,
                message: "Invalid request",
                error: {
                MESSAGE: "No report found"
            
                }
            });
        }
        res.status(200).json({
            success: true,
            data: {
                updatedReport
            },
            message: "Report Updated Successfully",
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

app.get('/user/profile/goals-by-category', async (req, res) => {
try{
    const userGoal= await Goal.find();

    var vacational = userGoal.filter(item => item.category == "vacational");
    var personalDevelopment = userGoal.filter(item => item.category == "personal development");
    var welbeing = userGoal.filter(item => item.category == "welbeing");

    const goals = {};

    goals.vacational = vacational;
    goals.personalDevelopment = personalDevelopment;
    goals.welbeing =  welbeing;

    res.status(200).json({
        success: true,
        data:{
            goals
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

app.get('/user/profile/report-by-goal-category', async (req, res) => {
try{ 
    const reports = await Report.find().populate('details.goal');

    const reportpriority = { 'vacational': 1, 'welbeing': 2, 'personal development': 3 };

       for(let x=0;x<reports.length;x++) {

       var singleReport = reports[x];

       for(let i = 0; i < singleReport.details.length; i++){

        singleReport.details.sort(function (a, b) {
        
        let val1=a.goal.category;
        let val2=b.goal.category;

        return reportpriority[val1] - reportpriority[val2] ;
       });
    }
    
    }

    res.status(200).json({
        success: true,
        data:{
            reports
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

// pagination
app.get('/user/profile/goals-page', async (req, res) => {
    try{
        const pageNo = parseInt(req.query.pageNo) || 1;
        const pageSize = parseInt(req.query.pageSize) || 2;
    
        const startIndex = (pageNo - 1) * pageSize;
        const total = await Goal.countDocuments();
        const goals = await Goal.find().skip(startIndex).limit(pageSize);

        res.status(200).json({
            success: true,
            totalPages: Math.ceil(total / pageSize),
            data: goals
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

app.listen(port, () => console.log(`Server running on port ${port}`));
