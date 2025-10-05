import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { MenuType } from '@prisma/client'

import { MENU } from '@/modules/admin/core/constants/permissions'
import { Permissions } from '@/modules/admin/core/decorators'
import { updateValidationPipe } from '@/pipes'

import { CreateMenuDto } from './dto/create-menu.dto'
import { UpdateMenuDto } from './dto/update-menu.dto'
import { MenuService } from './menu.service'
import { AdminController } from '../core/decorators/admin-controller.decorator'

@AdminController('menu')
@ApiTags('菜单管理模块')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @Permissions(MENU.READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取菜单' })
  @ApiOkResponse({
    description: '获取菜单树成功',
  })
  findMenuTree() {
    return this.menuService.findMenuTree()
  }

  @Get('/flat')
  @Permissions(MENU.READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取菜单扁平化列表' })
  @ApiOkResponse({
    description: '获取菜单扁平化列表成功',
  })
  findFlatMenuTree() {
    return this.menuService.findFlatMenuTree()
  }

  @Get('/permission')
  @Permissions(MENU.READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取有权限的菜单和按钮列表' })
  @ApiOkResponse({
    description: '获取有权限的菜单和按钮列表成功',
  })
  findPermissionMenus(@Query('type') type: MenuType) {
    return this.menuService.findPermissionMenus(type)
  }

  @Post()
  @Permissions(MENU.CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建菜单' })
  @ApiOkResponse({
    description: '创建菜单成功',
  })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto)
  }

  @Get(':id')
  @ApiBearerAuth()
  async getMenuById(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findMenuById(id)
  }

  @Put(':id')
  @Permissions(MENU.UPDATE)
  @UsePipes(updateValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新菜单' })
  @ApiOkResponse({
    description: '更新菜单成功',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto
  ) {
    return this.menuService.update(id, updateMenuDto)
  }

  @Delete(':id')
  @Permissions(MENU.DELETE)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除菜单' })
  @ApiOkResponse({
    description: '删除菜单成功',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.delete(id)
  }
}
