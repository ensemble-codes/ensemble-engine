import { ApiProperty } from '@nestjs/swagger';

export class DrawResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the draw',
    example: 123
  })
  lotteryId: number;

  @ApiProperty({
    description: 'Array of selected numbers for this draw',
    example: [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]]
  })
  selectedNumbers: number[][];

  @ApiProperty({
    description: 'Array of winning numbers for this draw',
    example: [7, 14, 23, 31, 42, 49]
  })
  winningNumbers: number[];

  @ApiProperty({
    description: 'Timestamp when the draw occurred',
    example: '2024-03-20T15:00:00Z'
  })
  drawDate: Date;

  @ApiProperty({
    description: 'Total prize pool for this draw in wei',
    example: '1000000000000000000'
  })
  prizePool: string;

  @ApiProperty({
    description: 'Status of the draw',
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
    example: 'COMPLETED'
  })
  status: string;
}

export class GetDrawsQueryDto {
  @ApiProperty({
    required: true,
    description: 'Address of the user',
  })
  ownerAddress: string;
} 