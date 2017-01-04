<%@include file="/libs/granite/ui/global.jsp" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib prefix="multicomposite" uri="http://www.citytechinc.com/taglibs/multicomposite" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@page import="com.citytechinc.aem.multicompositeaddon.Multicomposite" %>
<c:set var="cmp" value="<%= cmp %>"/>
<c:set var="multi" value="<%=new Multicomposite(cmp,i18n,slingRequest)%>"/>

<div ${multi.attributes} data-original-count="${fn:length(multi.values)}" data-base-name="${multi.baseName}" data-multi-name="${multi.name}" data-allow-reorder="${multi.allowReorder }">
	<ol class="coral-Multifield-list js-coral-Multicompositefield-list multicompositefield-list">
		<c:forEach var="value" items="${multi.values}" varStatus="valueStatus">
			<li class="js-coral-Multicompositefield-input coral-Multicompositefield-input coral-Multifield-input">
				<section  class='coral-Form-fieldset multicompositefield-item'>
					<div>
						<c:forEach var="field" items="${multi.fields}">
							<div class="multicompositefield-field" data-content-path="${multi.name}/${multi.baseName}#/${field.name}" data-parent-content-path="${multi.parentContentPath}">
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
								<c:set var="multiPath" scope="request" value="${multi.name}/${multi.baseName}${valueStatus.count}/${field.name}"/>
								<c:set var="multiParentContentPath" scope="request" value="${multi.name}/${multi.baseName}#/${field.name}"/>
								<multicomposite:widgetInclude valueMap="${value}" path="${field.path}"/>
								<c:set var="multiPath" scope="request" value=""/>
								<c:set var="multiParentContentPath" scope="request" value=""/>
							</div>
						</c:forEach>
					</div>
				</section>
			</li>
		</c:forEach>
	</ol>
	<script class="js-coral-Multicompositefield-input-template" type="text/html">
		<section  class='coral-Form-fieldset multicompositefield-item' data-name='${multi.name}/'>
			<div>
				<c:forEach var="field" items="${multi.fields}">
					<div class="multicompositefield-field" data-content-path="${multi.name}/${multi.baseName}#/${field.name}" data-parent-content-path="${multi.parentContentPath}">
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
						<c:set var="multiPath" scope="request" value="${multi.name}/${multi.baseName}${valueStatus.count}/${field.name}"/>
						<c:set var="multiParentContentPath" scope="request" value="${multi.name}/${multi.baseName}#/${field.name}"/>
						<multicomposite:widgetInclude path="${field.path}"/>
						<c:set var="multiPath" scope="request" value=""/>
						<c:set var="multiParentContentPath" scope="request" value=""/>
					</div>
				</c:forEach>
			</div>
		</section>
	</script>
</div>
