const express = require('express');
const multer = require('multer');
const path = require('path');
const { getVideoDurationInSeconds } = require('get-video-duration');

const app = express();
const port = 3000;

// Define storage configuration
const storage = multer.diskStorage({
    destination: './uploads/', // Directory to save the file
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function formatFileSize(bytes, decimalPoint) {
    if (bytes == 0) return '0 Bytes';
    var k = 1000,
        dm = decimalPoint || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // display name extension size duration
        const name = req.file.originalname;
        const extension = req.file.mimetype;
        const bytesize = req.file.size;

        let size = formatFileSize(bytesize, decimalPoint = 2)

        let pattern = /video/i;

        if (pattern.test(extension)) {
            let videoDuration = await getVideoDurationInSeconds(req.file.path);
            res.json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    name: name,
                    extension: extension,
                    size: size,
                    videoDuration: videoDuration

                },
            });
        } else {
            res.json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    name: name,
                    extension: extension,
                    size: size
                },
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading file', error
        });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));