toonfshader = '\n\
precision highp float;\n\
\n\
uniform sampler2D uSampler;\n\
uniform sampler2D uToonSampler;\n\
uniform vec3 uLightColor;\n\
uniform vec3 uLookVec;\n\
uniform vec4 uAmbient;\n\
uniform vec4 uDiffuse;\n\
uniform vec4 uSpecular;\n\
uniform vec4 uEmission;\n\
uniform vec4 uDetectColor;\n\
uniform float uDetectTouch;\n\
uniform float uUseTexture;\n\
uniform float uUseLighting;\n\
uniform float uShininess;\n\
uniform float uUseToon;\n\
uniform vec3 uLightDirection;\n\
\n\
varying vec2 vTextureCoord;\n\
varying vec4 vColor;\n\
varying vec3 vNormal;\n\
\n\
\n\
void main() {\n\
    vec4 texColor = texture2D(uSampler, vTextureCoord);\n\
    vec4 baseColor = vColor*uDiffuse ;\n\
    baseColor *= texColor * uUseTexture + vec4(1.0, 1.0, 1.0, 1.0) * (1.0 - uUseTexture);\n\
    float alpha = uDetectColor.a * uDetectTouch + baseColor.a * (1.0 - uDetectTouch);\n\
    if (alpha < 0.2) {\n\
        discard;\n\
    }\n\
    else {\n\
        vec4 tmpA = vec4(0.1,0.1,0.1,1.0);\n\
        vec4 phongColor = uAmbient;\n\
        vec3 N = normalize(vNormal);\n\
        vec3 L = normalize(uLightDirection);\n\
        vec3 E = normalize(uLookVec);\n\
        vec3 R = reflect(-L, N);\n\
        float lamber = max(dot(N, L) , 0.0);\n\
        phongColor += uDiffuse * lamber;\n\
        float s = max(dot(R,-E), 0.0);\n\
        vec4 specularColor= uSpecular * pow(s, uShininess) * sign(lamber);\n\
        vec4 tmp = (uEmission* baseColor + specularColor + vec4(baseColor.rgb * phongColor.rgb * uLightColor.rgb, baseColor.a)) \n\
            * (1.0 - uDetectTouch) + uDetectColor * uDetectTouch;\n\
        if(uUseToon>0.1){\n\
             float toon = pow( max(dot(N,-E), 0.0),2.0);\n\
             gl_FragColor=vec4( \n\
                     texture2D(uToonSampler,vec2(tmp.r,toon)).r * tmp.r, \n\
                     texture2D(uToonSampler,vec2(tmp.g,toon)).g* tmp.g, \n\
                     texture2D(uToonSampler,vec2(tmp.b,toon)).b* tmp.b, \n\
                     tmp.a);\n\
    }else{\n\
        gl_FragColor=tmp;\n\
         }\n\
     }\n\
}';