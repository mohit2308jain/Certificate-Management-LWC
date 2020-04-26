trigger ChangeName on Voucher__c (before insert) {
    /*
    Voucher__c[] s = Trigger.new;
    String cid = null;
    cid = s[0].Certification__c;
    Integer cou = [SELECT COUNT() FROM Voucher__c WHERE Certification__c =: cid];
    System.debug(cou);
    s[0].Name = s[0].Name + ' V' + (cou+1);
    */
    for(Voucher__c v: Trigger.new){
        Integer i = [SELECT COUNT() FROM Voucher__c WHERE Certification__c =: v.Certification__c];
        v.Name = v.Name + ' V' + (i+1);
    }
}