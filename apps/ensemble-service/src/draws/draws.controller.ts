import { Controller, Get, Param, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DrawsService } from './draws.service';
import { DrawResponseDto, GetDrawsQueryDto } from './dto/draw.dto';

@ApiTags('draws')
@Controller('draws')
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  @Get(':drawId')
  @ApiOperation({ summary: 'Get draw by ID' })
  @ApiParam({
    name: 'drawId',
    description: 'Unique identifier of the draw',
    type: Number,
    example: 123
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the draw details',
    type: DrawResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Draw not found'
  })
  async getDraw(
    @Param('drawId', ParseIntPipe) drawId: number
  ): Promise<DrawResponseDto> {
    return this.drawsService.getDraw(drawId);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest draw' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the latest draw details',
    type: DrawResponseDto 
  })
  async getLatestDraw(): Promise<DrawResponseDto> {
    return this.drawsService.getLatestDraw();
  }

  @Get()
  @ApiOperation({ summary: 'Get all draws for user' })
  @ApiQuery({
    name: 'ownerAddress',
    description: 'Ethereum address of the user',
    required: true,
    type: String,
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all draws for the user',
    type: [DrawResponseDto] 
  })
  async getAllDraws(
    @Query(ValidationPipe) query: GetDrawsQueryDto
  ): Promise<DrawResponseDto[]> {
    return this.drawsService.getAllDraws(query.ownerAddress);
  }
} 