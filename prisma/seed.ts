import { MenuType, Prisma, PrismaClient } from "@prisma/client";
import crypto from "node:crypto";
import { promisify } from "node:util";

const SUPER_ADMIN_USERNAME = "admin";
const SUPER_ADMIN_PASSWORD = "admin";
const SUPER_ADMIN_EMAIL = "admin@admin.com";
const SUPER_ADMIN_NICKNAME = "admin";
const SUPER_ADMIN_PHONE = "13333333333";

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

const prisma = new PrismaClient();

async function main() {
  // 可以将不需要创建的内容注释掉

  // 创建超级管理员账号
  await createSuperAdmin();

  // 创建首页菜单数据
  await createHomeMenu();
  // 创建组件示例菜单数据
  // await createExampleMenu();
  // 创建异常页菜单数据
  // await createExceptionMenu();
  // 创建多级菜单数据
  // await createMultiMenu();
  // 创建系统菜单数据
  await createSystemMenu();
  // 创建关于菜单数据
  // await createAboutMenu();
}

async function createSuperAdmin() {
  const password = await hashPassword(SUPER_ADMIN_PASSWORD);

  const newUser: Prisma.UserCreateInput = {
    username: SUPER_ADMIN_USERNAME,
    password,
    email: SUPER_ADMIN_EMAIL,
    nickName: SUPER_ADMIN_NICKNAME,
    phone: SUPER_ADMIN_PHONE,
    isSuperAdmin: true,
  };

  await prisma.user.create({
    data: newUser,
  });
}

async function createHomeMenu() {
  await prisma.menu.create({
    data: {
      title: "首页",
      type: MenuType.MENU,
      icon: "icon-park-outline:computer",
      code: "home:read",
      path: "/",
      i18nKey: "menu.home",
      sort: 0,
      isShow: true,
      description: "系统首页",
    },
  });
}

async function createSystemMenu() {
  // 创建根菜单：系统设置
  const systemSettings = await prisma.menu.create({
    data: {
      title: "系统设置",
      type: MenuType.DIRECTORY,
      icon: "icon-park-outline:config",
      i18nKey: "menu.system",
      sort: 5,
      isShow: true,
      description: "系统设置",
    },
  });

  // 创建子菜单：用户管理
  const userManagement = await prisma.menu.create({
    data: {
      parentId: systemSettings.id,
      title: "用户管理",
      type: MenuType.MENU,
      icon: "icon-park-outline:user",
      code: "system:user:read",
      path: "/system/user",
      i18nKey: "menu.systemUser",
      sort: 0,
      isShow: true,
    },
  });

  // 创建用户管理菜单的功能权限
  await prisma.menu.createMany({
    data: [
      {
        parentId: userManagement.id,
        title: "新增用户",
        type: MenuType.FEATURE,
        code: "system:user:create",
      },
      {
        parentId: userManagement.id,
        title: "编辑用户",
        type: MenuType.FEATURE,
        code: "system:user:update",
      },
      {
        parentId: userManagement.id,
        title: "删除用户",
        type: MenuType.FEATURE,
        code: "system:user:delete",
      },
    ],
  });

  // 创建子菜单：角色管理
  const roleManagement = await prisma.menu.create({
    data: {
      parentId: systemSettings.id,
      title: "角色管理",
      type: MenuType.MENU,
      icon: "icon-park-outline:every-user",
      code: "system:role:read",
      path: "/system/role",
      i18nKey: "menu.systemRole",
      sort: 1,
      isShow: true,
    },
  });

  // 创建角色管理菜单的功能权限
  await prisma.menu.createMany({
    data: [
      {
        parentId: roleManagement.id,
        title: "新增角色",
        type: MenuType.FEATURE,
        code: "system:role:create",
      },
      {
        parentId: roleManagement.id,
        title: "编辑角色",
        type: MenuType.FEATURE,
        code: "system:role:update",
      },
      {
        parentId: roleManagement.id,
        title: "删除角色",
        type: MenuType.FEATURE,
        code: "system:role:delete",
      },
    ],
  });

  // 创建子菜单：菜单管理
  const menuManagement = await prisma.menu.create({
    data: {
      parentId: systemSettings.id,
      title: "菜单管理",
      type: MenuType.MENU,
      icon: "icon-park-outline:hamburger-button",
      code: "system:menu:read",
      path: "/system/menu",
      i18nKey: "menu.systemMenu",
      sort: 2,
      isShow: true,
    },
  });

  // 创建菜单管理菜单的功能权限
  await prisma.menu.createMany({
    data: [
      {
        parentId: menuManagement.id,
        title: "新增菜单",
        type: MenuType.FEATURE,
        code: "system:menu:create",
      },
      {
        parentId: menuManagement.id,
        title: "编辑菜单",
        type: MenuType.FEATURE,
        code: "system:menu:update",
      },
      {
        parentId: menuManagement.id,
        title: "删除菜单",
        type: MenuType.FEATURE,
        code: "system:menu:delete",
      },
    ],
  });

  // 创建子菜单：API管理
  const apiManagement = await prisma.menu.create({
    data: {
      parentId: systemSettings.id,
      title: "API管理",
      type: MenuType.MENU,
      icon: "icon-park-outline:api",
      code: "system:api:read",
      path: "/system/api",
      i18nKey: "menu.systemApi",
      sort: 3,
      isShow: true,
    },
  });

  // 创建API管理菜单的功能权限
  await prisma.menu.createMany({
    data: [
      {
        parentId: apiManagement.id,
        title: "新增API",
        type: MenuType.FEATURE,
        code: "system:api:create",
      },
      {
        parentId: apiManagement.id,
        title: "编辑API",
        type: MenuType.FEATURE,
        code: "system:api:update",
      },
      {
        parentId: apiManagement.id,
        title: "删除API",
        type: MenuType.FEATURE,
        code: "system:api:delete",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
