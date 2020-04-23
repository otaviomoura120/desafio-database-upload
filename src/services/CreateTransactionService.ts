import { getCustomRepository, Repository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  categoryTitle: string;
}

class CreateTransactionService {
  private transactionsRepository: TransactionsRepository;

  private categoryRepository: Repository<Category>;

  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    this.transactionsRepository = getCustomRepository(TransactionsRepository);
    this.categoryRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('incorrect type of transaction', 400);
    }

    const transactions = await this.transactionsRepository.find();

    const balance = await this.transactionsRepository.getBalance({
      transactions,
    });

    if (type === 'outcome') {
      if (value > balance.total) {
        throw new AppError('Sorry you dont have enough money', 400);
      }
    }

    const category = await this.categoryRepository.findOne({
      where: { title: categoryTitle },
    });

    let category_id: string;

    if (!category) {
      const newCategory = this.categoryRepository.create({
        title: categoryTitle,
      });

      await this.categoryRepository.save(newCategory);
      category_id = newCategory.id;
    } else {
      category_id = category.id;
    }

    const transaction = this.transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await this.transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
