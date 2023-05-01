import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../../../common/base-components/base.controller';
import { ProductEntity } from '../../../../entities/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../../../../common/dto/product.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/enums/auth.enum';
import {
  IsOwnerGuard,
  JwtGuard,
  RolesGuard,
} from '../../../../common/guards/auth.guard';
import {
  CustomHttpResponse,
  FetchResponse,
} from '../../../../common/interfaces/http.responses';
import {
  SaveResult,
  UpdateResult,
} from '../../../../common/interfaces/repo.responses';
import { ProductsService } from '../services/products.service';
import { getMetadataArgsStorage } from 'typeorm';
import { prepareFilterAndSortField } from '../../../../common/helpers/general';

@Controller('product')
export class ProductsController extends BaseController<ProductEntity> {
  private productSortFields: string[] = [];
  private productFilterFields: string[] = [];

  constructor(private readonly productsService: ProductsService) {
    super();
    this.productSortFields = ['price', 'quantity'];
    const propertyNames = getMetadataArgsStorage().columns.map((column) => {
      if (
        column.target === ProductEntity &&
        column.propertyName !== undefined
      ) {
        return column.propertyName;
      }
    });
    this.productFilterFields = propertyNames.filter(
      (name) => name !== undefined,
    );
  }

  @Get()
  async getAds(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('sort') sort: string,
  ) {
    this.fetchResponse = new FetchResponse<ProductEntity>();

    try {
      const { filterFields, sortFields } =
        prepareFilterAndSortField<ProductEntity>(
          this.productFilterFields,
          this.productSortFields,
          filter,
          sort,
        );

      const products = await this.productsService.getProducts({
        page,
        limit,
        filterFields,
        sortFields,
      });
      this.fetchResponse.success = true;
      this.fetchResponse.docs = products;
      return this.fetchResponse;
    } catch (e) {
      this.fetchResponse.errors.push(e);
      throw new BadRequestException(this.fetchResponse);
    }
  }

  @Get(':id')
  async getProduct(
    @Param('id') id: number,
    // @Request() req,
  ): Promise<FetchResponse<ProductEntity>> {
    this.fetchResponse = new FetchResponse<ProductEntity>();

    try {
      const product = await this.productsService.getProductById(id);
      if (!product) {
        this.fetchResponse.errors.push('Forbidden Resource');
        throw new ForbiddenException(this.fetchResponse);
      }

      this.fetchResponse.success = true;
      this.fetchResponse.docs = [product];
      return this.fetchResponse;
    } catch (e) {
      this.fetchResponse.errors.push(e);
      throw new BadRequestException(this.fetchResponse);
    }
  }

  @Post('')
  @Roles(Role.USER)
  @UseGuards(JwtGuard, RolesGuard)
  async createProduct(
    @Request() req,
    @Body() createProductDto: CreateProductDto,
  ) {
    this.response = new CustomHttpResponse();

    const userId = req.user.userId;
    if (userId != createProductDto.userId) {
      this.response.errors.push('Forbidden Resource');
      throw new ForbiddenException(this.response);
    }

    // const categoryExists = await this.categoriesService.exists({
    //   id: createProductDto.categoryId,
    // });
    // if (!categoryExists) {
    //   this.response.errors.push('Invalid CategoryId!');
    //   throw new BadRequestException(this.response);
    // }

    let saveResult: SaveResult;
    try {
      saveResult = await this.productsService.createProduct(createProductDto);
      this.response.success = true;
      return { ...this.response, ...saveResult };
    } catch (e) {
      this.response.errors.push(e);
      throw new BadRequestException(this.response);
    }
  }

  @Roles(Role.USER)
  @UseGuards(JwtGuard, RolesGuard, IsOwnerGuard)
  @Patch(':id')
  async updateProduct(
    @Request() req,
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    this.response = new CustomHttpResponse();

    const userId = req.user.userId;
    const productExists = await this.productsService.exists({ id, userId });
    if (!productExists) {
      throw new ForbiddenException('Forbidden Resource');
    }

    // if (updateProductDto.categoryId) {
    //   const categoryExists = await this.categoriesService.exists({
    //     id: updateProductDto.categoryId,
    //   });
    //   if (!categoryExists) {
    //     this.response.errors.push('Invalid CategoryId!');
    //     throw new BadRequestException(this.response);
    //   }
    // }

    let updateResult: UpdateResult;
    try {
      updateResult = await this.productsService.updateProduct(
        id,
        updateProductDto,
      );
      this.response.success = true;
      return { ...this.response, ...updateResult };
    } catch (e) {
      this.response.errors.push(e);
      throw new BadRequestException(this.response);
    }
  }
}
