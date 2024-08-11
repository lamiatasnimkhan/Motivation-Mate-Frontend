const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3001;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get images
app.get('/get_image', async (req, res) => {
    const rover = req.query.rover || 'curiosity';
    let sol;
    
    // Set sol range based on rover
    
        sol = Math.floor(Math.random() * 3000); // Curiosity's broad sol range
    

    const camera = ['FHAZ', 'RHAZ', 'NAVCAM'][Math.floor(Math.random() * 3)];
    const apiKey = 'dU6noeL63JqqXkai01N0CbUTrNpb3KQpbKbUMb0i';

    try {
        const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`, {
            params: {
                sol: sol,
                camera: camera,
                api_key: apiKey
            }
        });

        const roverPics = response.data.photos;
        if (roverPics.length === 0) {
            return res.json({ message: `No image from ${rover} ${camera} available from sol ${sol}` });
        }

        const randomPic = roverPics[Math.floor(Math.random() * roverPics.length)];
        const imgUrl = randomPic.img_src;

        res.json({
            image_url: imgUrl,
            rover_name: randomPic.rover.name,
            earth_date: randomPic.earth_date,
            camera_name: randomPic.camera.full_name
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from NASA API' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
