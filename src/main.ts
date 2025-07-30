import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, provideHttpClient,withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { routes } from './app/app.routes';
import { LoaderInterceptor } from './app/loader.interceptor';

  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes, withEnabledBlockingInitialNavigation()),
      provideHttpClient(withInterceptorsFromDi()),
      { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    ],
  });