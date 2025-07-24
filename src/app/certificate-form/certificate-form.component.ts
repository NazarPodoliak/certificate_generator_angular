import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-certificate-form',
  templateUrl: './certificate-form.component.html',
  styleUrls: ['./certificate-form.component.css']
})
export class CertificateFormComponent implements OnInit {
  certificateForm: FormGroup;
  courses: any[] = [];
  certificateGenerated = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.certificateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      course: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.http.get<any>('http://localhost:3000/api/courses')
      .subscribe({
        next: (response) => {
          this.courses = response.data || response;
        },
        error: (error) => {
          console.error('Error loading courses:', error);
        }
      });
  }

  onSubmit() {
    
    if (this.certificateForm.valid) {
      const formData = this.certificateForm.value;
      const completion_date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const certificateData = {
        name: formData.name,
        email: formData.email,
        course: formData.course,
        completion_date: completion_date
      };



      this.http.post<any>('http://localhost:3000/api/generate-certificate', certificateData)
        .subscribe({
                  next: (response) => {
          if (response.success) {
              // Download the PDF
              const downloadUrl = `http://localhost:3000${response.data.downloadUrl}`;
              window.open(downloadUrl, '_blank');
              
              // Show success message
              this.certificateGenerated = true;
              setTimeout(() => {
                this.certificateGenerated = false;
              }, 5000);
              
              // Reset form
              this.certificateForm.reset();
            }
          },
                  error: (error) => {
          console.error('Error generating certificate:', error);
          alert(`Error generating certificate: ${error.message}`);
        }
        });
    } else {
      this.certificateForm.markAllAsTouched();
    }
  }
}
