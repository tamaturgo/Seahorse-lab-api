import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global exception filter for domain exceptions
  app.useGlobalFilters(new DomainExceptionFilter());

  // CORS configuration
  app.enableCors({
    origin: true, // Permite qualquer origem em desenvolvimento
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600,
  });

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Seahorse Habitat Hub API')
    .setDescription('API para gerenciamento de habitats de cavalos-marinhos - Cavalos-Marinhos RJ')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticação e gerenciamento de sessão')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('checklist', 'Configuração e execução de checklists diários')
    .addTag('systems', 'Gerenciamento de sistemas e tanques')
    .addTag('feeding', 'Registro de alimentação')
    .addTag('water-parameters', 'Parâmetros da água')
    .addTag('medicine', 'Saúde e medicamentos')
    .addTag('stock', 'Controle de estoque')
    .addTag('audit-logs', 'Logs de auditoria (apenas admin)')
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  });
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
