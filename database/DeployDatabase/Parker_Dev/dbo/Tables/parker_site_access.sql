CREATE TABLE [dbo].[parker_site_access] (
    [ad_account] VARCHAR (100) NOT NULL,
    [site_code]  VARCHAR (100) NOT NULL,
    CONSTRAINT [PK_parker_site_access] PRIMARY KEY CLUSTERED ([ad_account] ASC, [site_code] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_parker_site_access]
    ON [dbo].[parker_site_access]([ad_account] ASC);

