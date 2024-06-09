import { Tour } from '@/models/tour';
import dbConfig from '@/configs/dbConfig';
import { readFile } from '@/utils/fileHelper';
import * as dotenv from 'dotenv';
import path from 'path';
import { exec } from 'child_process';

const ENV_FILE_PATH = path.resolve(__dirname, '../configs/config.env');
const dotenvResult = dotenv.config({ path: ENV_FILE_PATH });

if (dotenvResult.error) {
  console.error('Error loading environment variables:', dotenvResult.error);
  process.exit(1);
}

const importData = async () => {
  try {
    const tours = await readFile('tours-simple.json');
    await Tour.create(tours);
    console.log('Data successfully imported!');
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('All tour data successfully deleted!');
  } catch (error) {
    console.error('Error deleting data:', error);
  }
};

const stopNodemon = () => {
  exec('pkill -f nodemon', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error stopping nodemon: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Stopped nodemon: ${stdout}`);
  });
  process.exit();
};

const run = async () => {
  try {
    await dbConfig();

    const argv2 = process.argv?.[2];
    if (argv2 === '--import') {
      await importData();
    } else if (argv2 === '--delete') {
      await deleteData();
    } else {
      console.log(
        'Invalid command. Use "--import" to import data or "--delete" to delete all data.',
      );
    }

    stopNodemon();
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Execute the main function
run();
