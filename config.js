var config = {};

config.db = {};
config.web = {};

config.db.url = "postgres://calendar:asdf@localhost:5432/calendar";
//postgres://user:password@host:port/database

config.web.port = 3000;
config.web.secureKey = 'MIICXAIBAAKBgQChm75ObmHa7tjxfNHsJ8orMACCjurZbQDqpJFPXiYXbTlOhP+LDi8cl1WmK4Y9vKNgMSAu3tCvy3kb8qGh/yCLYHEVnz678dM2K8yRW7uc/4VAztwkYOTfoydwmdA1C1og7CiiQtvkwoTxwv3kGlFb18whJee2YOBQ0B6GXGFy6wIDAQABAoGABYfyDHckrDyOej1eZem6tp2u9sjzarubU2yMeJ3tSdH4KyLMKDM1E5JuYQCOWKCTKuCjjFcd51Zcb8NvGr9DmtOjJpBLKmrDrKzg2XLGipAIsgMLG0TpUzAuMhj1D8bNmLu/CPO+RndEx3mF85u531fr5KtypDYv8R4ogyyCJnkCQQDU8CKKgSLaRLUz3GnBl9HSsq053sTdGq5fXXBBnaWqdjvmbEDRgtIlk93B4Mu/dQJ9pDWalD17kDtyK6Tx+msdAkEAwkpByDA4bfHdAriI4tf4iMjBfkOHdZHMp/Qy406qySpA3DfK7UUwkWLl3DM4zjG2ZNt/a+dtY0xIQkG1W6RvpwJBAJEW+oIjUYsly84Ffm3xs398Tbojx0HcvzmtoiKjd1E59MChvFzFZclDApPrRwkygjr326pzHZ2G/mphwKc8eSUCQDKIB6XeTL7jmdy8S/Xbv+src4+4VoHQgs7n51hRPIAHekkMRb4CMciOVUQ5Gjwel9aRdAmHbl7WFzEMT/Pex58CQCtIeFjbrzUq8hWkDP35HlnLjHRCfeFER+4xLaFsPedjIaPmfnKEd8oHNh3WmptHFPsgOWpG8+ygOYpt7FRuxYA=';

config.web.email = {
		user : 'email.calendar.app@gmail.com',
		password : 'xTBDcne+LaEUCZpXlPYBoI',
		host : 'smtp.gmail.com',
		ssl : true
};

module.exports = config;