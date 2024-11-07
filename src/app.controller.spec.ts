import { TokenGuard } from './presentation/guards/token-required.guard';
import { EditOriginalUrlDto, UrlIdDto } from './presentation/dtos';
import { ShortController } from './application/short.controller';
import { UrlEntity } from './infrastructure/database/entities';
import { AuthGuard } from './presentation/guards/auth.guard';
import { ShortService } from './application/short.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('ShortController', () => {
  let shortController: ShortController;
  let shortService: ShortService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortController],
      providers: [
        {
          provide: ShortService,
          useValue: {
            urlRepository: {
              findBy: jest.fn(),
              update: jest.fn(),
            },
            shortenUrl: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    shortController = module.get<ShortController>(ShortController);
    shortService = module.get<ShortService>(ShortService);
  });

  describe('list', () => {
    it('should return a list of user URLs', async () => {
      const mockUrls: Partial<UrlEntity>[] = [{ id: '1', originalUrl: 'http://example.com', userId: '', createdAt: new Date() }];
      jest.spyOn(shortService.urlRepository, 'findBy').mockResolvedValue(mockUrls as any);

      const req = { user: { sub: 'user1' } };
      const result = await shortController.list(req as any);

      expect(result).toEqual(mockUrls);
      expect(shortService.urlRepository.findBy).toHaveBeenCalledWith({ userId: 'user1' });
    });
  });

  describe('create', () => {
    it('should create a shortened URL', async () => {
      const mockUrl = { id: '1', originalUrl: 'http://example.com', userId: 'user1', createdAt: new Date() };
      jest.spyOn(shortService, 'shortenUrl').mockResolvedValue(mockUrl as any);

      const req = { user: { sub: 'user1' } };
      const body = { originalUrl: 'http://example.com' };
      const result = await shortController.create(req as any, body);

      expect(result).toEqual(mockUrl);
      expect(shortService.shortenUrl).toHaveBeenCalledWith('http://example.com', 'user1');
    });
  });

  describe('edit', () => {
    it('should update an existing shortened URL', async () => {
      const updatedUrl = { id: '1', originalUrl: 'http://newexample.com', userId: 'user1', createdAt: new Date() };
      jest.spyOn(shortService.urlRepository, 'update').mockResolvedValue(updatedUrl as any);

      const req = { user: { sub: 'user1' } };
      const params = { id: '1' } as UrlIdDto;
      const body = { originalUrl: 'http://newexample.com' } as EditOriginalUrlDto;
      const result = await shortController.edit(req as any, params, body);

      expect(result).toEqual(updatedUrl);
      expect(shortService.urlRepository.update).toHaveBeenCalledWith({
        data: { originalUrl: 'http://newexample.com' },
        compositeId: { id: '1', userId: 'user1' },
      });
    });
  });

  describe('destroy', () => {
    it('should delete a shortened URL', async () => {
      const deletedUrl = { id: '1', originalUrl: 'http://example.com', userId: 'user1', deletedAt: new Date(), createdAt: new Date() };
      jest.spyOn(shortService.urlRepository, 'update').mockResolvedValue(deletedUrl as any);

      const req = { user: { sub: 'user1' } };
      const params = { id: '1' } as UrlIdDto;
      const result = await shortController.destroy(req as any, params);

      expect(result).toEqual(deletedUrl);
      expect(shortService.urlRepository.update).toHaveBeenCalledWith({
        data: { deletedAt: expect.any(Date) },
        compositeId: { id: '1', userId: 'user1' },
      });
    });
  });
});
