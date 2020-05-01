public with sharing class EmployeeController {
    
    public EmployeeController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployeeList() {
        return [ SELECT Id, Emp_ID__c, Name, Email__c, Primary_Skill__c, Secondary_Skill__c, Experience__c,Company_Name__c, Comments__c FROM Employee__c ORDER BY Id LIMIT 10];
    }

    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployee(String searchTerm) {
        String searchTermLike = '%'+searchTerm+'%';
        return [ SELECT Id, Emp_ID__c, Name, Email__c, Primary_Skill__c, Secondary_Skill__c, Experience__c,Company_Name__c, Comments__c FROM Employee__c WHERE Name LIKE :searchTermLike];
    }

}