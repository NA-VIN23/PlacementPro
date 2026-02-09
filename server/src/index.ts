import app from './app';
// import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

// await connectDB();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("HOD Routes RELOADED! Check logs.");
    const secretLength = process.env.JWT_SECRET?.length || 0;
    console.log(`JWT_SECRET Status: ${secretLength > 0 ? 'Loaded' : 'MISSING'} (Length: ${secretLength})`);
    console.log("HOD Routes RELOADED! Check logs."); // Force restart
});
