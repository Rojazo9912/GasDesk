import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
export declare class EscalationProcessor {
    private readonly prisma;
    constructor(prisma: PrismaService);
    handleTimeout(job: Job): Promise<void>;
}
