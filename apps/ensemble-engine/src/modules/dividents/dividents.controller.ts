import { Controller } from '@nestjs/common';
import { DividentsService } from './services/dividents.service';

@Controller('dividents')
export class DividentsController {
  constructor(private readonly dividentsService: DividentsService) {}
}
