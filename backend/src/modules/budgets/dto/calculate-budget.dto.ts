import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CalculateBudgetDto {
  @IsString({ message: 'O campo "cliente" deve ser um texto' })
  @IsNotEmpty({ message: 'O campo "cliente" é obrigatório' })
  @MaxLength(150, {
    message: 'O campo "cliente" deve ter no máximo 150 caracteres',
  })
  client!: string;

  @IsString({ message: 'O campo "projeto" deve ser um texto' })
  @IsNotEmpty({ message: 'O campo "projeto" é obrigatório' })
  @MaxLength(150, {
    message: 'O campo "projeto" deve ter no máximo 150 caracteres',
  })
  project!: string;

  @IsDefined({ message: 'O campo "horas" é obrigatório' })
  hours!: string | number;

  @IsDefined({ message: 'O campo "custo/hora" é obrigatório' })
  hourlyRate!: string | number;

  @IsDefined({ message: 'O campo "despesas extras" é obrigatório' })
  extraExpenses!: string | number;

  @IsDefined({ message: 'O campo "margem" é obrigatório' })
  marginPercent!: string | number;
}
