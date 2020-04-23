import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  csvFilename: string;
}
class ImportTransactionsService {
  async execute({ csvFilename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', csvFilename);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: Transaction[] = [];
    const lines: string[] = [];
    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // const promises = lines.map(async elem => {
    //   const transaction = await createTransaction.execute({
    //     title: elem[0],
    //     value: parseFloat(elem[2]),
    //     type: elem[1],
    //     categoryTitle: elem[3],
    //   });
    //   transactions.push(transaction);
    // });

    // await Promise.all(promises);
    for (const elem of lines) {
      const transaction = await createTransaction.execute({
        title: elem[0],
        value: parseFloat(elem[2]),
        type: elem[1],
        categoryTitle: elem[3],
      });
      transactions.push(transaction);
    }

    // parseCSV.on('data', line => {
    //   console.log(line);
    // });
    return transactions;
  }
}

export default ImportTransactionsService;
