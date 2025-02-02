async function processIncomingEvent(t){if(window.Espo&&window.Espo.Ajax){t=t.Data?.phoneNumber;if(t){const i=formatPhoneNumber(t);if(i)try{var a=await Espo.Ajax.getRequest("Lead?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(t));if(0<a.list.length)window.location.hash="#Lead/view/"+a.list[0].id;else{var e=await Espo.Ajax.getRequest("Opportunity?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(t));if(0<e.list.length)window.location.hash="#Opportunity/view/"+e.list[0].id;else{var n,o=await Espo.Ajax.getRequest("Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(t));let e=null,a=null;(a=0<o.list.length&&(e=o.list[0].id,0<(n=await Espo.Ajax.getRequest("Opportunity?maxSize=1&where[0][attribute]=contactId&where[0][type]=equals&where[0][value]="+e)).list.length)?n.list[0].id:a)?window.location.hash="#Opportunity/view/"+a:((e=null)=>{var a=`
            <div class="modal fade" id="leadModal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                <span class="fas fa-user-plus"></span>
                                Create Lead
                            </h4>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="leadForm" class="record">
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
                                                    <input type="tel" class="form-control main-element" name="phoneNumber" value="${i}" readonly>
                                                </div>
                                            </div>

                                            <!-- Email -->
                                            <div class="cell form-group" data-name="email">
                                                <label class="control-label" data-name="email">Email</label>
                                                <div class="field" data-name="email">
                                                    <input type="email" class="form-control main-element" name="emailAddress" placeholder="Email Address">
                                                </div>
                                            </div>

                                            <!-- Status -->
                                            <div class="cell form-group" data-name="status">
                                                <label class="control-label" data-name="status">
                                                    Status
                                                    <span class="required-sign">*</span>
                                                </label>
                                                <div class="field" data-name="status">
                                                    <select class="form-control main-element" name="status" required>
                                                        <option value="New">New</option>
                                                        <option value="Assigned">Assigned</option>
                                                        <option value="In Process">In Process</option>
                                                        <option value="Converted">Converted</option>
                                                        <option value="Recycled">Recycled</option>
                                                        <option value="Dead">Dead</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Source -->
                                            <div class="cell form-group" data-name="source">
                                                <label class="control-label" data-name="source">Source</label>
                                                <div class="field" data-name="source">
                                                    <select class="form-control main-element" name="source">
                                                        <option value="Phone">Phone</option>
                        
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveLead">Save</button>
                        </div>
                    </div>
                </div>
            </div>`;const o=$(a).appendTo("body");o.modal("show"),$("#saveLead").on("click",async function(){var e=document.getElementById("leadForm");if(e.checkValidity()){var a=new FormData(e),a={status:a.get("status")||"New",source:a.get("source")||"Phone",salutationName:a.get("salutationName")||"Mr.",...Object.fromEntries(a),name:a.get("firstName")+" "+a.get("lastName")},t=$(this);t.prop("disabled",!0).html('<span class="spinner-border spinner-border-sm"></span> Saving...');try{var n=await Espo.Ajax.postRequest("Lead",a);o.modal("hide"),window.location.hash="#Lead/view/"+n.id}catch(e){console.error("Error creating lead:",e),Espo.Ui.error("Error creating lead. Please try again.")}finally{t.prop("disabled",!1).text("Save")}}else e.reportValidity()}),o.on("hidden.bs.modal",function(){o.remove()}),e&&Object.entries(e).forEach(([e,a])=>{e=o.find(`[name="${e}"]`);e.length&&e.val(a)})})(e)}}}catch(e){console.error("BitvoiceCC Error:",e);a=new URLSearchParams({phoneNumber:t,contactId:contactId||""});window.location.hash="#Opportunity/create?"+a.toString()}else console.error("BitvoiceCC: Invalid phone number")}else console.error("BitvoiceCC: Missing required phoneNumber")}else console.error("BitvoiceCC: Espo not initialized")}function formatPhoneNumber(e){return e?(e=e.replace(/\D/g,"")).length<10?(console.error("BitvoiceCC: Invalid phone number length"),null):e.startsWith("00")?"+"+e.slice(2):10===e.length||11===e.length&&e.startsWith("0")?"+91"+(e.startsWith("0")?e.slice(1):e):10<e.length?e.startsWith("+")?e:"+"+e:null:(console.error("BitvoiceCC: Missing required phoneNumber"),null)}function encodePhoneNumberForApi(e){e=formatPhoneNumber(e);if(e)return encodeURIComponent(e);throw new Error("Invalid phone number format")}window.BitvoiceCCF={activeCalls:new Map,EVENT_TYPES:{INBOUND_CALL:"INBOUND_CALL",OUTBOUND_CALL:"OUTBOUND_CALL",HANGUP:"HANGUP",AGENT_LOGIN:"AGENT_LOGIN",MISSEDCALL:"MISSEDCALL"},async handleEvent(e){var a=e.Event;if(Object.values(this.EVENT_TYPES).includes(a))try{switch(a){case this.EVENT_TYPES.INBOUND_CALL:await this.handleInboundCall(e);break;case this.EVENT_TYPES.OUTBOUND_CALL:await this.handleOutboundCall(e);break;case this.EVENT_TYPES.HANGUP:await this.handleHangup(e);break;case this.EVENT_TYPES.AGENT_LOGIN:await this.handleAgentLogin(e);break;case this.EVENT_TYPES.MISSEDCALL:await this.handleMissedCall(e)}}catch(e){console.error("Error handling event:",e)}else console.log("Unhandled event type: "+a)},async handleOutboundCall(e){var a=e.Data,t=a.uniqueid;this.activeCalls.set(t,{startTime:new Date,data:a}),await processIncomingEvent(e)},async handleInboundCall(e){var a=e.Data,t=a.uniqueid;this.activeCalls.set(t,{startTime:new Date,data:a}),await processIncomingEvent(e)},async handleHangup(e){console.log("Hangup event:",e.Data),console.log("Active calls:",this.activeCalls);var e=e.Data,a=e.uniqueid;if(this.activeCalls.has(a)){var t=this.activeCalls.get(a),t=new Date-t.startTime;e.duration=t;try{await this.createCallEntity(e)}catch(e){console.error("Error in handleHangup while creating call entity:",e)}this.activeCalls.delete(a)}},async handleAgentLogin(e){},async handleMissedCall(e){},async getParentEntity(){var e=window.location.hash.match(/#([^/]+)\/view\/([^/]+)/);return e?{entityType:e[1],entityId:e[2]}:null},async createCallEntity(e){if(!window.Espo||!window.Espo.Ajax)throw new Error("BitvoiceCC: Espo not initialized");let a=null;try{var t=await window.Espo.Ajax.getRequest("App/user");a=t.user}catch(e){console.warn("Could not fetch current user data:",e)}var t=await this.getParentEntity(),n=new Date(e.eventtime),o=new Date(n.getTime()+e.duration),i=e=>e.getFullYear()+"-"+String(e.getMonth()+1).padStart(2,"0")+"-"+String(e.getDate()).padStart(2,"0")+" "+String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0"),l=Math.round(e.duration/1e3);let s=0;s=l<60&&0<l?1:Math.round(l/60);l={name:"Call with "+(e.cid_name||e.cid_num),status:"Held",direction:"INBOUND_CALL"===e.calldirection?"Inbound":"Outbound",dateStart:i(n),dateEnd:i(o),duration:s,description:`Call ${e.calldirection}
From: ${e.from}
To: ${e.to}
Agent: `+e.agent,phoneNumber:e.from,callId:e.uniqueid};t&&(l.parentType=t.entityType,l.parentId=t.entityId),a&&(l.assignedUserId=a.id,a.teamsIds&&0<a.teamsIds.length&&(l.teamsIds=a.teamsIds),a.defaultTeamId)&&(l.defaultTeamId=a.defaultTeamId);try{var r=await window.Espo.Ajax.getRequest("Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(e.from)),d=(0<r.list.length&&(l.contactId=r.list[0].id,l.contactName=r.list[0].name),await window.Espo.Ajax.postRequest("Call",l));return console.log("Call entity created:",d),d}catch(e){throw console.error("Error creating call entity:",e),e}}},window.BitvoiceCC=function(e){window.BitvoiceCCF.handleEvent(e)},window.BitvoiceCCAPI=window.BitvoiceCC;
