# Azure DevOps Setup Guide

## Pipeline Configuration

### 1. Create Variable Group
In Azure DevOps, create a variable group named `CustomCoachPro-Variables` with:

| Variable | Description | Secret |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | Backend URL | No |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Backend public key | No |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV` | Azure SWA token for dev | Yes |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD` | Azure SWA token for prod | Yes |

### 2. Create Environments
Create two environments in Azure DevOps:
- `development` - for develop branch deployments
- `production` - for main branch deployments (add approval gates)

### 3. Azure Static Web Apps Setup
1. Create two Azure Static Web Apps (dev and prod)
2. Get the deployment tokens from each
3. Add tokens to the variable group

### 4. Pipeline Files
- `azure-pipelines.yml` - Main CI/CD pipeline (root directory)
- `.azure/azure-pipelines-pr.yml` - PR validation pipeline

## Future Azure Migration Path

When migrating from Lovable Cloud to Azure:

### Database Migration
Replace backend client with Azure SQL:
```typescript
// Current (Lovable Cloud)
import { supabase } from "@/integrations/supabase/client";

// Future (Azure)
import { azureClient } from "@/integrations/azure/client";
```

### Authentication Migration
Replace with Azure AD B2C or similar:
- Update `src/lib/auth.ts` service layer
- Swap auth provider in context

### Storage Migration
Replace with Azure Blob Storage:
- Update `src/lib/storage.ts` service layer
- Change bucket references to container references

### Functions Migration
Convert edge functions to Azure Functions:
- Same logic, different runtime
- Deploy via Azure Functions Core Tools

## Architecture for Portability

The codebase uses service abstraction layers:
- `src/services/` - Business logic (backend-agnostic)
- `src/lib/` - Infrastructure adapters (swap for Azure)
- `src/hooks/` - React hooks using services
