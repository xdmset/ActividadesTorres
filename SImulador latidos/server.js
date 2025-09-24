const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');

const app = express();
const PORT = 3000; 

app.use(cors()); 
app.use(express.json()); 


const dbConfig = {
    host: 'localhost',
    user: 'root',.,m mknlknmlkln
    password: '',

    database: 'heartbeat_simulator'
};

const pool = mysql.createPool(dbConfig);

app.post('/save_data', async (req, res) => {
 
    const { profile_id, bpm, activity } = req.body;

   
    if (!profile_id || !bpm || !activity) {
        return res.status(400).json({ status: 'error', message: 'Datos incompletos.' });
    }

    try {
    
        const sql = 'INSERT INTO heart_rate_logs (profile_id, bpm, activity) VALUES (?, ?, ?)';
        
        await pool.execute(sql, [profile_id, bpm, activity]);

       
        res.status(201).json({ status: 'success', message: 'Registro guardado exitosamente.' });

    } catch (error) {
        console.error("Error al guardar en la base de datos:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});