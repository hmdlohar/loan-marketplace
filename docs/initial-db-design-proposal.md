Every document have 
CreatedAt
ModifiedAt
ModifiedBy
CreatedBy
_id: createOIdString

User :

- email / password
- 10 digit mobile
- role: admin | partner -> the role field is optional field. If not present it means nothing but the user is not internal user.
  // The access field is kind of important. This describes which partner you can access.
  // for customer this field means nothing. Customer can only apply. not have any access.
- access?:{
  PartnerIDs: []
  CustomerID: string
  }

Products: This will be offerings by bank. Banks offere different kind of loan products and we list them for customer

- Title
- slug
- ShortDescription
- LongDescription
- loanType: personal, home, lap, working-capital, credit-card
- partnerId
- mainImage: optional?
- FormFields: {label: "name", type: "text", required: true}, {label: "email", type: "email", required: true}, 

Partners: Basically banks who offers loan

- Name
- Logo: required

Documents: This Generic store for documents. This can be referenced by any entity
- Name
- Path
- Context: {}. This will store connecting info about the document. This is very flexible 
- Parsed Data


Applications: This is created when customer click on apply. Customer can do multipel applicatio and multiple application records shell be created
- Status: draft|submitted|under-review|approved|rejected
- ProductID
- Documents:{} We shell store document ids of different document types. Not much of clear rightnow
- FormData: {} Data submitted by customer while creating applicatin. 

ApplicationLogs: This is to track applications
- Application ID
- Event: 
- Message: string
.. Other fields defined later. 


Customer: This is coollection for customer. This holds detail of customer 
- First name
- last name
- dob
- email
... and all the personal info we shell ask the customer. 



