<%@include file="/libs/granite/ui/global.jsp" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib prefix="multicomposite" uri="http://www.citytechinc.com/taglibs/multicomposite" %>
<%@page import="com.citytechinc.aem.multicompositeaddon.Multicomposite" %>
<c:set var="cmp" value="<%= cmp %>"/>
<c:set var="multi" value="<%=new Multicomposite(cmp,i18n,slingRequest)%>"/>

<div ${multi.readOnlyAttributes }>
	<c:if test="${not empty multi.fieldLabel }">
		<label class="coral-Form-fieldlabel">${multi.fieldLabel}</label>
	</c:if>
	<ol class="coral-Form-field coral-List coral-List--minimal">
		<c:forEach var="value" items="${multi.values}" varStatus="valueStatus">
			<li class="coral-List-item">
				<section  class='coral-Form-fieldset'>
					<div>
						<c:forEach var="field" items="${multi.fields}">
							<div>
                                <c:if test="${not empty field.fieldLabel}">
                                    <label class="coral-Form-fieldlabel">${field.fieldLabel}</label>
                                </c:if>
                                <c:if test="${not empty field.fieldDescription}">
                                    <span class="coral-Form-fieldinfo coral-Icon coral-Icon--infoCircle coral-Icon--sizeS"
                                          data-init="quicktip"
                                          data-quicktip-type="info"
                                          data-quicktip-arrow="right"
                                          data-quicktip-content="${field.fieldDescription}">
                                    </span>
                                </c:if>
								<multicomposite:widgetInclude valueMap="${value}" path="${field.path}" readOnly="true"/>
							</div>
						</c:forEach>
					</div>
				</section>
			</li>
		</c:forEach>
	</ol>
</div>
