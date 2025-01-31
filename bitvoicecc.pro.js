async function processIncomingEvent(t){const s={salutation:"Mr.",stage:"Prospecting",maxResults:1};if(window.Espo&&window.Espo.Ajax){t=t.Data?.phoneNumber;if(t){const l=formatPhoneNumber(t);if(l)try{var a=await Espo.Ajax.getRequest("Opportunity?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(t));if(0<a.list.length)window.location.hash="#Opportunity/view/"+a.list[0].id;else{var n,i=await Espo.Ajax.getRequest("Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(t));let e=null,a=null;(a=0<i.list.length&&(e=i.list[0].id,0<(n=await Espo.Ajax.getRequest("Opportunity?maxSize=1&where[0][attribute]=contactId&where[0][type]=equals&where[0][value]="+e)).list.length)?n.list[0].id:a)?window.location.hash="#Opportunity/view/"+a:((i=null)=>{var e=`
            <div class="modal fade" id="enquiryModal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                <span class="fas fa-plus"></span>
                                Create Enquiry
                            </h4>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="enquiryForm" class="record">
                                <div class="record-grid">
                                    <div class="panel panel-default">
                                        <div class="panel-body">
                                            <!-- Name Section -->
                                            <div class="cell form-group" data-name="name">
                                                <label class="control-label" data-name="name">
                                                    Name
                                                    <span class="required-sign">*</span>
                                                </label>
                                                <div class="field" data-name="name">
                                                    <div class="row">
                                                        <div class="col-sm-2">
                                                            <select class="form-control main-element" name="salutationName">
                                                                <option value="Mr.">Mr.</option>
                                                                <option value="Mrs.">Mrs.</option>
                                                                <option value="Ms.">Ms.</option>
                                                                <option value="Dr.">Dr.</option>
                                                            </select>
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="firstName" placeholder="First Name" required maxlength="100">
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="lastName" placeholder="Last Name" required maxlength="100">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Phone -->
                                            <div class="cell form-group" data-name="phone">
                                                <label class="control-label" data-name="phone">Phone</label>
                                                <div class="field" data-name="phone">
                                                    <input type="tel" class="form-control main-element" name="phoneNumber" value="${l}" readonly>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveEnquiry">Save</button>
                        </div>
                    </div>
                </div>
            </div>`;const o=$(e).appendTo("body");o.modal("show"),$("#saveEnquiry").on("click",async function(){var e=document.getElementById("enquiryForm");if(e.checkValidity()){var a=new FormData(e),a={stage:s.stage,salutationName:a.get("salutationName")||s.salutation,...Object.fromEntries(a),name:a.get("firstName")+" "+a.get("lastName")},t=(i?.id&&(a.contactId=i.id),$(this));t.prop("disabled",!0).html('<span class="spinner-border spinner-border-sm"></span> Saving...');try{var n=await Espo.Ajax.postRequest("Opportunity",a);o.modal("hide"),window.location.hash="#Opportunity/view/"+n.id}catch(e){console.error("Error creating opportunity:",e),Espo.Ui.error("Error creating opportunity. Please try again.")}finally{t.prop("disabled",!1).text("Save")}}else e.reportValidity()}),o.on("hidden.bs.modal",function(){o.remove()}),i&&Object.entries(i).forEach(([e,a])=>{e=o.find(`[name="${e}"]`);e.length&&e.val(a)})})(e)}}catch(e){console.error("BitvoiceCC Error:",e);a=new URLSearchParams({phoneNumber:t,contactId:contactId||""});window.location.hash="#Opportunity/create?"+a.toString()}else console.error("BitvoiceCC: Invalid phone number")}else console.error("BitvoiceCC: Missing required phoneNumber")}else console.error("BitvoiceCC: Espo not initialized")}function formatPhoneNumber(e){return e?(e=e.replace(/\D/g,"")).length<10?(console.error("BitvoiceCC: Invalid phone number length"),null):e.startsWith("00")?"+"+e.slice(2):10===e.length||11===e.length&&e.startsWith("0")?"+91"+(e.startsWith("0")?e.slice(1):e):10<e.length?e.startsWith("+")?e:"+"+e:null:(console.error("BitvoiceCC: Missing required phoneNumber"),null)}function encodePhoneNumberForApi(e){e=formatPhoneNumber(e);if(e)return encodeURIComponent(e);throw new Error("Invalid phone number format")}window.BitvoiceCCF={activeCalls:new Map,EVENT_TYPES:{INBOUND_CALL:"INBOUND_CALL",OUTBOUND_CALL:"OUTBOUND_CALL",HANGUP:"HANGUP",AGENT_LOGIN:"AGENT_LOGIN",MISSEDCALL:"MISSEDCALL"},async handleEvent(e){var a=e.Event;if(Object.values(this.EVENT_TYPES).includes(a))try{switch(a){case this.EVENT_TYPES.INBOUND_CALL:await this.handleInboundCall(e);break;case this.EVENT_TYPES.OUTBOUND_CALL:await this.handleOutboundCall(e);break;case this.EVENT_TYPES.HANGUP:await this.handleHangup(e);break;case this.EVENT_TYPES.AGENT_LOGIN:await this.handleAgentLogin(e);break;case this.EVENT_TYPES.MISSEDCALL:await this.handleMissedCall(e)}}catch(e){console.error("Error handling event:",e)}else console.log("Unhandled event type: "+a)},async handleOutboundCall(e){var a=e.Data,t=a.uniqueid;this.activeCalls.set(t,{startTime:new Date,data:a}),await processIncomingEvent(e)},async handleInboundCall(e){var a=e.Data,t=a.uniqueid;this.activeCalls.set(t,{startTime:new Date,data:a}),await processIncomingEvent(e)},async handleHangup(e){var a,t=e.Data,t=t.uniqueid;this.activeCalls.has(t)&&(a=this.activeCalls.get(t),a=new Date-a.startTime,e.Data.duration=a,this.activeCalls.delete(t))},async handleAgentLogin(e){},async handleMissedCall(e){}},window.BitvoiceCC=function(e){window.BitvoiceCCF.handleEvent(e)},window.BitvoiceCCAPI=window.BitvoiceCC;
