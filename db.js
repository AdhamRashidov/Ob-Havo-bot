import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://Adham:35455289@cluster0.irov3lr.mongodb.net/ob-havo", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(chalk.bold.green("MongoDB atlasga ulandi"))
    } catch (error) {
        console.error(chalk.bold.red("MongoDB ga ulanib bo'lmadi", error.message));
    }
}

export default connectDB;