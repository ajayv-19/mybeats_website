# Backend Deployment Instructions

## How to Push Backend Code to AWS Amplify

### Prerequisites
- AWS Amplify CLI installed (`amplify` command available)
- AWS credentials configured
- Currently in the project root directory

### Step 1: Check Current Status
```bash
amplify status
```
This shows what resources will be updated. You should see the `user` function marked as "Update".

### Step 2: Push Backend Changes
```bash
amplify push
```

This command will:
1. Build the Lambda function code
2. Package dependencies
3. Deploy to AWS Lambda
4. Update the API Gateway endpoints

### Step 3: Follow the Prompts
When you run `amplify push`, you'll be asked:
- **Are you sure you want to continue?** → Type `Y` and press Enter
- The CLI will show you what will be created/updated
- Review the changes and confirm

### Step 4: Wait for Deployment
The deployment process typically takes 2-5 minutes. You'll see progress updates in the terminal.

### Alternative: Push Only the Function (Faster)
If you only want to update the `user` function:
```bash
amplify push function user
```

### Verify Deployment
After deployment completes, you can verify by:
1. Check the terminal output for the API endpoint URL
2. Test the new endpoints:
   - `GET /underwriting/:fire_department_id/history`
   - `PUT /underwriting/:fire_department_id/:underwriting_year/carrier-input`
   - `GET /analysis/list`
   - etc.

### Troubleshooting

**If you get dependency errors:**
```bash
cd amplify/backend/function/user/src
npm install
cd ../../../../..
amplify push
```

**If you need to check logs:**
```bash
amplify function logs user
```

**If deployment fails:**
- Check AWS CloudFormation console for error details
- Verify your AWS credentials are correct
- Ensure you have proper IAM permissions

### Important Notes

1. **Database Tables**: The new Sequelize models we created (FireDepartment, Underwriting, etc.) expect the database tables to already exist. Make sure you've run the SQL CREATE TABLE statements from the requirements document.

2. **Lookup Tables**: After deployment, you may want to initialize the lookup tables. You can do this by:
   - Creating a one-time script to call `calculationService.initializeLookupTables()`
   - Or manually inserting the lookup values via SQL

3. **Environment**: The current environment is `dev`. To deploy to production:
   ```bash
   amplify env checkout prod  # or your production env name
   amplify push
   ```



