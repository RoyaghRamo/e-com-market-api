import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '../../../../entities/category.entity';
import { Repository } from 'typeorm';
import {
  DeleteResult,
  PaginationParams,
  SaveResult,
  UpdateResult,
} from '../../../../common/interfaces/repo.responses';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../../../common/dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async getCategories(
    paginationParams?: PaginationParams<CategoryEntity>,
  ): Promise<CategoryEntity[]> {
    const page = paginationParams.page ? paginationParams.page : 1;
    const take = paginationParams.limit ? paginationParams.limit : 10;
    const skip = (page - 1) * take;

    const findOptions = {
      take,
      skip,
      where: paginationParams.filterFields,
      order: paginationParams.sortFields,
    };

    return await this.categoriesRepository.find(findOptions);
  }

  async exists(filter: Partial<CategoryEntity>) {
    const foundCategories = await this.getCategoryByFilter(filter);
    return !(!foundCategories || foundCategories.length == 0);
  }

  async getCategoryByFilter(filter: Partial<CategoryEntity>) {
    return await this.categoriesRepository.findBy(filter);
  }

  async getCategory(userId: number, id: number): Promise<CategoryEntity> {
    return await this.categoriesRepository.findOne({ where: { id, userId } });
  }

  async getCategoryById(id: number): Promise<CategoryEntity> {
    return await this.categoriesRepository.findOne({ where: { id } });
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<SaveResult> {
    const category = this.categoriesRepository.create(createCategoryDto);
    const { id } = await this.categoriesRepository.save(category);

    return { lastInsertedId: id };
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateResult> {
    const { affected } = await this.categoriesRepository.update(
      id,
      updateCategoryDto,
    );

    return { affected };
  }

  async deleteCategory(id: number): Promise<DeleteResult> {
    const { affected } = await this.categoriesRepository.delete(id);

    return { affected };
  }
}
