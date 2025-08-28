import mongoose from 'mongoose';

const connectDB = async () => {
        await mongoose.connect(process.env.MONGOOSE_URL).then(() => {
            console.log('Connected to MongoDB');
        }).catch((error) => {
            console.log(error);
        });
        
};

export default connectDB;