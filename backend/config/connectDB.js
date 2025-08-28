import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connectionString = process.env.MONGOOSE_URL;
        
        if (!connectionString) {
            throw new Error('MONGOOSE_URL environment variable is not defined');
        }
        
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;