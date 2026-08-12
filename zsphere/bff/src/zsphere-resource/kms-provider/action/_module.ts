import { Module } from '@nestjs/common'

import { BackupNkpService } from './backup'
import { CreateKmsProviderService } from './create'
import { DeleteKmsProviderService } from './delete'
import { RekeyKeyProviderRefsService } from './rekey'
import { RestoreNkpService } from './restore'
import { SetDefaultKmsProviderService } from './set-default'
import { TrustKmsProviderService } from './trust'
import { UpdateKmsProviderService } from './update'
import { UploadKmsClientCsrService } from './upload-client-csr'
import { UploadKmsClientIdentityService } from './upload-client-identity'
import { UploadKmsClientSignedCertService } from './upload-signed-cert'

@Module({
  providers: [
    CreateKmsProviderService,
    DeleteKmsProviderService,
    UpdateKmsProviderService,
    BackupNkpService,
    RestoreNkpService,
    SetDefaultKmsProviderService,
    TrustKmsProviderService,
    UploadKmsClientCsrService,
    UploadKmsClientIdentityService,
    UploadKmsClientSignedCertService,
    RekeyKeyProviderRefsService
  ]
})
export class KmsProviderActionModule {}
