import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { auditExtension } from '../common/context/prisma-audit.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private _extendedClient: any;

  constructor() {
    super();
    this._extendedClient = this.$extends(auditExtension);
    
    // Proxy para que las llamadas a PrismaService se redirijan al cliente extendido
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target._extendedClient) {
          return target._extendedClient[prop];
        }
        return target[prop];
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
