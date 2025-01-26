const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.get("/weather", async (req, res) => {
    try {
        const response = await axios.get("https://api.openweathermap.org/data/2.5/weather?lat=27.394369&lon=78.202850&appid=0f215d247a4bfac7e6fd25708775b7d8");
        const result = response.data;
        console.log(result);
        res.status(200).json({
            success: true,
            data: {
                result
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to make request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));