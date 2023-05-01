import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../../../../entities/product.entity';
import { Repository } from 'typeorm';
import {
  DeleteResult,
  PaginationParams,
  SaveResult,
  UpdateResult,
} from '../../../../common/interfaces/repo.responses';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../../../../common/dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async getProducts(
    paginationParams?: PaginationParams<ProductEntity>,
  ): Promise<ProductEntity[]> {
    const page = paginationParams.page ? paginationParams.page : 1;
    const take = paginationParams.limit ? paginationParams.limit : 10;
    const skip = (page - 1) * take;

    const findOptions = {
      take,
      skip,
      where: paginationParams.filterFields,
      order: paginationParams.sortFields,
    };

    return await this.productsRepository.find(findOptions);
  }

  async exists(filter: Partial<ProductEntity>) {
    const foundProducts = await this.getProductByFilter(filter);
    return !(!foundProducts || foundProducts.length == 0);
  }

  async getProductByFilter(filter: Partial<ProductEntity>) {
    return await this.productsRepository.findBy(filter);
  }

  async getProduct(userId: number, id: number): Promise<ProductEntity> {
    return await this.productsRepository.findOne({ where: { id, userId } });
  }

  async getProductById(id: number): Promise<ProductEntity> {
    return await this.productsRepository.findOne({ where: { id } });
  }

  async createProduct(createProductDto: CreateProductDto): Promise<SaveResult> {
    const product = this.productsRepository.create(createProductDto);
    const { id } = await this.productsRepository.save(product);

    return { lastInsertedId: id };
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<UpdateResult> {
    const { affected } = await this.productsRepository.update(
      id,
      updateProductDto,
    );

    return { affected };
  }

  async deleteProduct(id: number): Promise<DeleteResult> {
    const { affected } = await this.productsRepository.delete(id);

    return { affected };
  }
}
