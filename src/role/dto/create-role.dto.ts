import { IsString } from "class-validator";

export class CreateRoleDto {
    @IsString({ message: "O nome é obrigatório" })
    name!: string;

    @IsString({ message: "A descrição é obrigatório" })
    description!: string;

    @IsString({
        message:
            "O perfil referente ao usuário vindo do Protheus é obrigatório",
    })
    profileId!: string;
}
