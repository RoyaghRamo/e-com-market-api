import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export const passwordPatternError =
  'Password must clear the following conditions:\n\t* at least 1 lower character\n\t* at least 1 upper character\n\t* at least 1 number\n\t* at least 1 special character\n\t* Minimum length is 8\n';

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;

export class LoginDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Matches(passwordRegex, {
    message: passwordPatternError,
  })
  readonly password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Matches(passwordRegex, {
    message: passwordPatternError,
  })
  readonly password: string;

  @IsString()
  readonly confirmPassword: string;
}
