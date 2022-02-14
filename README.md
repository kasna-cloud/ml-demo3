# ml-demo3

This repo contains the code for the Kasna/Eliiza Google ML Specialisation, demo 3.
Code Repo: https://github.com/kasna-cloud/ml-demo3

Radio monitoring live dashboard:
https://grafana.eliiza.ai/d/radio-analytics/real-time-radio-analytics?orgId=1&refresh=1m

Radio monitoring application repo:
https://gitlab.mantelgroup.com.au/eliiza/radio-media-monitoring/-/tree/aws-version/
(note that its on the non-default branch, ignore the branch name tho)

Radio monitoring k8s deployment repo:
https://gitlab.mantelgroup.com.au/eliiza/eliiza-k8s/eliiza-apps/-/tree/staging/radio-monitor

## 2. Use-Case

Example of an ML model using Pre-Trained ML APIs OR AutoML and trained/evaluated using any dataset. If using Pre-Trained ML APIs, the training of the model need not be described. If using AutoML, hyper-parameter tuning and model design/architecture optimization need not be described.

## 3. Success Criteria
### 3.3.1 Code
#### 3.3.1.1 Code Repository
Partners must provide a link to the code repository (e.g., GitHub, GitLab, GCP CSR), which includes a ReadMe file.

*Evidence* must include an active link to the code repository containing all code that is used in demo # 3. This code must be reviewable/readable by the assessor, and modifiable by the customer. In addition, the repository should contain a ReadMe file with code descriptions and detailed instructions for running model/application.

#### 3.3.1.2 Code origin certification
Partners must certify to either of these two scenarios: 1) all code is original and developed within the partner organization, or 2) licensed code is used, post-modification.

*Evidence* must include a certification by the partner organization for either of the above code origin scenarios. In addition, if licensed code is used post-modification, the partner must certify that the code has been modified per license specifications.

### 3.3.2 Data
#### 3.3.2.1 Dataset in GCP
Partners must describe the dataset being used for demo #3 and provide documentation of where within GCP the data of demo #3 is stored (for access by the ML models during training, testing, and in production, as appropriate).

*Evidence* must include the Project Name and Project ID for the GCP storage where the dataset (for demo #3) resides, and a description of the independent features and outcome variables of interest within the dataset.

### 3.3.3 Whitepaper/Blog post
#### 3.3.3.1 Business Goal and ML Solution
Partners must describe:
* The business question/goal being addressed.
* The ML use case.
* How ML solution is expected to address the business question/goal?

*Evidence* must include (in the Whitepaper) a top-line description of the business question/goal being addressed in this demo, and how the proposed ML solution will address this business goal.

#### 3.3.3.2 Data Exploration
Partners must describe the following:
* How and what type of data exploration was performed?
* What modeling decisions were influenced by data exploration?

*Evidence* must include a description (in the Whitepaper) of the tools used and the type of data exploration performed, along with code snippets (that accomplish the data exploration). Additionally, the whitepaper must describe how decisions regarding the use of pre-trained ML APIs or AutoML were influenced by data exploration.

#### 3.3.3.3 Feature Engineering
Partners must describe the following:
* If and what kind of feature engineering was performed?
* What features were selected for use in the ML model and why?

*Evidence* must include a description (in the Whitepaper) of the feature engineering performed (and rationale for the same), what original and engineered features were selected for incorporation as independent predictors in the ML model, and why. Evidence must include code snippets detailing the feature engineering and feature selection steps.

#### 3.3.3.4 Preprocessing and the data pipeline
The partner must describe the data preprocessing pipeline, and how this is accomplished via a package/function that is a callable API (that is ultimately accessed by the served, production model).

*Evidence* must include a description (in the Whitepaper) of how data preprocessing is accomplished, along with the code snippet that accomplishes data preprocessing as a callable API.

#### 3.3.3.5 ML Model Desgin(s) and Selection
Partners must describe either of the following:
* Which pre-trained ML API was chosen demo #3, and why?
 or
* Which AutoML product was chosen for demo #3?

*Evidence* must describe (in the Whitepaper) selection criteria implemented, as well as the specific ML model algorithms that were selected for training or evaluation purposes (as appropriate). Code snippets detailing the incorporation of the pre-trained ML APIs or the AutoML product into the ML model solution for demo #3 must be enumerated.

#### 3.3.3.6 ML model training and development
If the partner implements pre-trained APIs, this control can be skipped.

If the partner is using AutoML, the following must be described:
* Dataset sampling used for model training (and for dev/test independent datasets) and justification of sampling methods.
* Implementation of AutoML based model training.
* The model evaluation metric that is implemented, and a discussion of why the implemented metric is optimal given the business question/goal being addressed.

*Evidence* must describe (in the Whitepaper) each of the above ML model training and development bullet points (if AutoML is implemented in demo #3). In addition, code snippets that accomplish each of these tasks need to be enumerated.

#### 3.3.3.7 ML Model Evaluation
Partners must describe how the ML model, whether implemented using pre-trained ML APIs or via AutoML, performs on an independent test dataset.

*Evidence* must include records/data (in the Whitepaper) of how the ML model developed and selected to address the business question performed on an independent test dataset that reflects the distribution of data that the ML model is expected to encounter in a production environment. In addition, code snippets on model testing need to be enumerated.

### 3.3.4 Proof of Deployment
#### 3.3.4.1 Model application on GCP 
Partners must provide proof that the ML model/application is deployed and served on GCP.

*Evidence* must include the Project Name and Project ID of the deployed ML model.

#### 3.3.4.2 Callable library/application
Partners must demonstrate that the ML model for demo #3 is a callable library and/or application.

*Evidence* must include a demonstration of how the served model can be used to make a prediction via an API call.

#### 3.3.4.3 Editable model/application
Partners must demonstrate the deployed ML model, if using any AutoML product, is customizable.

*Evidence* must include a demonstration that the deployed model, if using any AutoML product, is fully functional after an appropriate code modification, as might be performed by a customer.

