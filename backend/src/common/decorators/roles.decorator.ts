import { SetMetadata } from '@nestjs/common';
import { PeranPengguna } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PeranPengguna[]) => SetMetadata(ROLES_KEY, roles);
