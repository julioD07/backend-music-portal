BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Song] ADD [state] BIT NOT NULL CONSTRAINT [Song_state_df] DEFAULT 1;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
