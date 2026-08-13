import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';


@Controller('organizations')
export class OrganizationsController {
    constructor(
        private readonly organizationsService: OrganizationsService
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() createOrganizationDto: CreateOrganizationDto,
        @Req() request: Request & { user: AuthenticatedUser}
    ) {
        return await this.organizationsService.create(request.user.id, createOrganizationDto)
    }
}
