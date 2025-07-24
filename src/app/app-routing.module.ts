import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificateFormComponent } from './certificate-form/certificate-form.component';

const routes: Routes = [
  { path: '', component: CertificateFormComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
