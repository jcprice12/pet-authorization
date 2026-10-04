import { HashService } from './hash.service';

// this is just here so that I can easily determine what password to save in the DB manually.
it('Print out hashed and salted password', async () => {
  const service = new HashService();
  const hashedAndSaltedPword = await service.hashWithSalt('password');
  console.log('The hashed and salted form of "password" is:', hashedAndSaltedPword);
});
