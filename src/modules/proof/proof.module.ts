import { Module } from '@nestjs/common';
import { ProofService } from './proof.service';
import { ProofController } from './proof.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProofController],
  providers: [ProofService],
  exports: [ProofService],
})
export class ProofModule {}